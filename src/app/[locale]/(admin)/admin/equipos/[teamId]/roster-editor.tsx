"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  uploadPlayerPhoto,
} from "@/lib/actions/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import type { Player, Group } from "@/lib/supabase/types";
import type { TeamWithGroup } from "@/lib/queries/teams";
import { BulkImportPlayersDialog } from "./bulk-import-players";

interface EnhancedRosterEditorProps {
  team: TeamWithGroup;
  initialPlayers: Player[];
  groups: Group[];
}

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function EnhancedRosterEditor({
  team,
  initialPlayers,
}: EnhancedRosterEditorProps) {
  const t = useTranslations("admin");
  const tPlayer = useTranslations("player");
  const router = useRouter();
  const { toast } = useToast();

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dorsal, setDorsal] = useState<number | undefined>();
  const [position, setPosition] = useState<string>("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  function openAdd() {
    setEditingPlayer(null);
    setFirstName("");
    setLastName("");
    setDorsal(undefined);
    setPosition("");
    setIsCaptain(false);
    setDateOfBirth("");
    setPhotoFile(null);
    setDialogOpen(true);
  }

  function openEdit(player: Player) {
    setEditingPlayer(player);
    setFirstName(player.first_name);
    setLastName(player.last_name);
    setDorsal(player.dorsal ?? undefined);
    setPosition(player.position ?? "");
    setIsCaptain(player.is_captain);
    setDateOfBirth(player.date_of_birth ?? "");
    setPhotoFile(null);
    setDialogOpen(true);
  }

  const handlePhotoSelect = useCallback((file: File) => {
    setPhotoFile(file);
  }, []);

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);

    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dorsal,
          position:
            (position || undefined) as
              | "goalkeeper"
              | "defender"
              | "midfielder"
              | "forward"
              | undefined,
          is_captain: isCaptain,
          date_of_birth: dateOfBirth || null,
        });

        if (photoFile) {
          const fd = new FormData();
          fd.append("photo", photoFile);
          await uploadPlayerPhoto(team.slug, editingPlayer.id, fd);
        }
      } else {
        const playerId = await createPlayer({
          team_id: team.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dorsal,
          position: position as
            | "goalkeeper"
            | "defender"
            | "midfielder"
            | "forward"
            | undefined,
          is_captain: isCaptain,
          date_of_birth: dateOfBirth || undefined,
        });

        if (photoFile && playerId) {
          const fd = new FormData();
          fd.append("photo", photoFile);
          await uploadPlayerPhoto(team.slug, playerId, fd);
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

  async function handleDelete(playerId: string) {
    if (!confirm(t("confirmDeletePlayer"))) return;
    try {
      await deletePlayer(playerId);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      toast(t("saved"), "success");
    } catch {
      toast(t("error"), "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
          {t("importPlayers")}
        </Button>
        <Button size="sm" onClick={openAdd}>
          {t("addPlayer")}
        </Button>
      </div>

      {/* Player list */}
      <div className="grid gap-3">
        {players.map((player) => {
          const age = getAge(player.date_of_birth);
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 border border-border bg-bg-card rounded-[10px] p-3"
            >
              <Avatar
                src={player.photo_url}
                fallback={`${player.first_name} ${player.last_name}`}
                size="md"
                shape="circle"
              />

              <span className="text-lg font-bold text-accent w-8 text-center shrink-0">
                {player.dorsal ?? "-"}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {player.first_name} {player.last_name}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {player.position && (
                    <Badge variant="default">{tPlayer(player.position)}</Badge>
                  )}
                  {player.is_captain && (
                    <Badge variant="accent">{tPlayer("captain")}</Badge>
                  )}
                  {age !== null && (
                    <span className="text-xs text-text-muted">
                      {age} {t("age").toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEdit(player)}
                >
                  {t("edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(player.id)}
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <p className="text-text-muted text-center py-8">{t("noPlayers")}</p>
        )}
      </div>

      {/* Add/Edit Player Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          {editingPlayer ? t("editPlayer") : t("addPlayer")}
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <FileUpload
              currentUrl={editingPlayer?.photo_url}
              shape="circle"
              onFileSelect={handlePhotoSelect}
              accept="image/*"
              maxSizeMB={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label={t("lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tPlayer("dorsal")}
              type="number"
              value={dorsal ?? ""}
              onChange={(e) =>
                setDorsal(e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <Select
              label={tPlayer("position")}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="">--</option>
              <option value="goalkeeper">{tPlayer("goalkeeper")}</option>
              <option value="defender">{tPlayer("defender")}</option>
              <option value="midfielder">{tPlayer("midfielder")}</option>
              <option value="forward">{tPlayer("forward")}</option>
            </Select>
          </div>
          <Input
            label={t("dateOfBirth")}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isCaptain}
              onChange={(e) => setIsCaptain(e.target.checked)}
              className="accent-accent"
            />
            {tPlayer("captain")}
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !firstName.trim() || !lastName.trim()}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </Dialog>

      <BulkImportPlayersDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        teamId={team.id}
      />
    </div>
  );
}
