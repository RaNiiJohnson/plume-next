"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AddTask({
  showForm,
  onOpen,
  onClose,
  onAdd,
}: {
  showForm: boolean; // true si le formulaire doit être affiché, false sinon
  onOpen: () => void; // fonction pour ouvrir le formulaire (appelée au clic sur le bouton)
  onClose: () => void; // fonction pour fermer le formulaire (croix ou après ajout)
  onAdd: (content: string) => void; // fonction appelée lors de la soumission du formulaire
}) {
  // État local pour stocker le contenu de la nouvelle carte à ajouter
  const [content, setContent] = useState("");

  // Si showForm est false, on affiche seulement le bouton "ajouter une carte"
  if (!showForm) {
    return (
      <Button
        size="lg"
        variant="ghost"
        className="text-muted-foreground"
        onClick={onOpen} // Ouvre le formulaire pour cette colonne
      >
        <Plus />
        <span>ajouter une carte</span>
      </Button>
    );
  }

  // Si showForm est true, on affiche le formulaire d'ajout de carte
  return (
    <form
      className="space-y-3 mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        // Si le contenu n'est pas vide (hors espaces), on appelle onAdd puis on vide le champ
        if (content.trim()) {
          onAdd(content);
          setContent("");
        }
      }}
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu de la carte"
        autoFocus
      />
      <div className="flex flex-row gap-2 items-center">
        <Button size="lg" type="submit">
          Ajouter une carte
        </Button>
        <X
          className="cursor-pointer"
          onClick={() => {
            setContent(""); // Réinitialise le champ
            onClose(); // Ferme le formulaire
          }}
        />
      </div>
    </form>
  );
}
