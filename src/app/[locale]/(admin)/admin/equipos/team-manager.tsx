"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createTeam, updateTeam, deleteTeam, uploadTeamLogo, toggleTeamReveal } from "@/lib/actions/teams";
import { slugify } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import type { Group } from "@/lib/supabase/types";
import type { TeamWithGroupAndCount } from "@/lib/queries/teams";
import { BulkImportTeamsDialog } from "./bulk-import-dialog";

interface TeamManagerProps {
  teams: TeamWithGroupAndCount[];
  groups: Group[];
}

export function TeamManager({ teams, groups }: TeamManagerProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithGroupAndCount | null>(null);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());
  const [bulkRevealing, setBulkRevealing] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [city, setCity] = useState("");
  const [groupId, setGroupId] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const filtered = teams.filter((team) => {
    const matchesSearch =
      !search ||
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.city?.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = !groupFilter || team.group_id === groupFilter;
    return matchesSearch && matchesGroup;
  });

  function openAdd() {
    setEditingTeam(null);
    setName("");
    setShortName("");
    setCity("");
    setGroupId("");
    setLogoFile(null);
    setDialogOpen(true);
  }

  function openEdit(team: TeamWithGroupAndCount) {
    setEditingTeam(team);
    setName(team.name);
    setShortName(team.short_name ?? "");
    setCity(team.city ?? "");
    setGroupId(team.group_id ?? "");
    setLogoFile(null);
    setDialogOpen(true);
  }

  const handleLogoSelect = useCallback((file: File) => {
    setLogoFile(file);
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: name.trim(),
          slug: slugify(name.trim()),
          short_name: shortName.trim() || null,
          city: city.trim() || null,
          group_id: groupId || null,
        });

        if (logoFile) {
          const fd = new FormData();
          fd.append("logo", logoFile);
          await uploadTeamLogo(slugify(name.trim()), editingTeam.id, fd);
        }
      } else {
        const slug = slugify(name.trim());
        const teamId = await createTeam({
          name: name.trim(),
          slug,
          short_name: shortName.trim() || undefined,
          city: city.trim() || undefined,
          group_id: groupId || undefined,
        });

        if (logoFile) {
          const fd = new FormData();
          fd.append("logo", logoFile);
          await uploadTeamLogo(slug, teamId, fd);
        }
      }

      toast(t("saved"), "success");
      setDialogOpen(false);
      router.refresh();
    } catch {
      toast(t("error"), "error");
    }
    setSaving(false);
  }

  async function handleDelete(team: TeamWithGroupAndCount) {
    if (!confirm(t("confirmDeleteTeam"))) return;
    try {
      await deleteTeam(team.id);
      toast(t("saved"), "success");
      router.refresh();
    } catch {
      toast(t("error"), "error");
    }
  }

  async function handleToggleReveal(team: TeamWithGroupAndCount) {
    setRevealingIds((prev) => new Set(prev).add(team.id));
    try {
      await toggleTeamReveal(team.id, !team.is_revealed);
      router.refresh();
    } catch {
      toast(t("error"), "error");
    }
    setRevealingIds((prev) => {
      const next = new Set(prev);
      next.delete(team.id);
      return next;
    });
  }

  async function handleBulkReveal(reveal: boolean) {
    const targets = filtered.filter((t) => t.is_revealed !== reveal);
    if (targets.length === 0) return;
    setBulkRevealing(true);
    try {
      await Promise.all(targets.map((t) => toggleTeamReveal(t.id, reveal)));
      router.refresh();
      toast(t("saved"), "success");
    } catch {
      toast(t("error"), "error");
    }
    setBulkRevealing(false);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder={t("search") + "..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="sm:max-w-[200px]"
        >
          <option value="">{t("allGroups")}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <div className="sm:ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleBulkReveal(true)} disabled={bulkRevealing}>
            {t("revealAll")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleBulkReveal(false)} disabled={bulkRevealing}>
            {t("hideAll")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
            {t("importTeams")}
          </Button>
          <Button size="sm" onClick={openAdd}>
            {t("addTeam")}
          </Button>
        </div>
      </div>

      {/* Team list */}
      <div className="grid gap-3">
        {filtered.map((team) => (
          <div
            key={team.id}
            className="flex items-center gap-4 border border-border bg-bg-card rounded-[10px] p-4 hover:border-accent/30 transition-colors cursor-pointer"
            onClick={() =>
              router.push(
                `/admin/equipos/${team.id}` as "/admin/equipos"
              )
            }
          >
            <Avatar
              src={team.logo_url}
              fallback={team.short_name || team.name}
              size="lg"
              shape="square"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary truncate">
                  {team.name}
                </h3>
                {team.short_name && (
                  <span className="text-xs text-text-muted">
                    ({team.short_name})
                  </span>
                )}
                <Badge variant={team.is_revealed ? "success" : "muted"}>
                  {team.is_revealed ? t("revealed") : t("hidden")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {team.city && (
                  <span className="text-sm text-text-secondary">{team.city}</span>
                )}
                {team.group && (
                  <Badge variant="accent">{team.group.name}</Badge>
                )}
                <span className="text-xs text-text-muted">
                  {t("playerCount", { count: team.player_count })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleToggleReveal(team)}
                disabled={revealingIds.has(team.id)}
                className="p-2 rounded-lg transition-colors hover:bg-bg-secondary disabled:opacity-50"
                title={team.is_revealed ? t("hide") : t("reveal")}
              >
                {team.is_revealed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-success">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-text-muted">
                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                  </svg>
                )}
              </button>
              <Button size="sm" variant="secondary" onClick={() => openEdit(team)}>
                {t("edit")}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(team)}>
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-8">{t("noResults")}</p>
        )}
      </div>

      {/* Add/Edit Team Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="max-w-3xl">
        <DialogHeader>
          {editingTeam ? t("editTeam") : t("addTeam")}
        </DialogHeader>
        <div className="flex gap-6">
          {/* Left: form fields */}
          <div className="flex-1 space-y-4">
            <Input
              label={t("teamName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("shortName")}
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="3-4 chars"
              />
              <Input
                label={t("city")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Select
              label={t("group")}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">{t("noGroup")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>
          {/* Right: logo upload */}
          <div className="shrink-0 flex flex-col items-center pt-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("logo")}
            </label>
            <FileUpload
              currentUrl={editingTeam?.logo_url}
              shape="square"
              onFileSelect={handleLogoSelect}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </Dialog>

      <BulkImportTeamsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
