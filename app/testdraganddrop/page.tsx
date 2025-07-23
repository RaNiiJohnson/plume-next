"use client";

// J'importe des outils React nécessaires pour gérer les états
import { useState } from "react";

// J'importe les outils principaux de la librairie @dnd-kit/core pour gérer le drag & drop
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";

// J'importe des outils spécifiques à la gestion de listes triées verticalement
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Outil pour transformer les coordonnées pendant le déplacement
import { CSS } from "@dnd-kit/utilities";

// Je crée une interface qui décrit ce qu'est une tâche
// Chaque tâche a un identifiant (id), une position (position) et un texte (content)
interface Task {
  id: string;
  position: number;
  content: string;
}

// C'est le composant principal de ma liste de tâches
export default function TaskList() {
  // Je crée un état qui contient la liste de mes tâches avec useState
  // Chaque tâche a un id, une position (1, 2, 3...) et un texte
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task-1", position: 1, content: "Tâche A" },
    { id: "task-2", position: 2, content: "Tâche B" },
    { id: "task-3", position: 3, content: "Tâche C" },
  ]);

  // Cette fonction est déclenchée automatiquement à la fin d’un déplacement (drag)
  function handleDragEnd(event: DragEndEvent) {
    // Je récupère les infos de l’élément déplacé
    const { active, over } = event;

    // active.id = id de l'élément qu'on a fait glisser (celui qu'on déplace)
    // over.id = id de l'élément qui est en dessous de notre souris quand on relâche

    // S’il n’y a rien en dessous ou si on relâche au même endroit, on arrête ici
    if (!over || active.id === over.id) return;

    // Je cherche la position (l’index) de la tâche qu’on a déplacée dans le tableau
    const oldIndex = tasks.findIndex((task) => task.id === active.id);

    // Je cherche la position (l’index) de la tâche sur laquelle on a relâché
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    // J’utilise arrayMove pour réorganiser le tableau des tâches
    // Ça déplace la tâche de oldIndex vers newIndex
    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    // Ensuite, je remets à jour la position (1, 2, 3...) de chaque tâche
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      position: index + 1, // index commence à 0, donc +1 pour commencer à 1
    }));

    // Je mets à jour l’état avec la nouvelle liste réorganisée
    setTasks(updatedTasks);
  }

  return (
    // DndContext : c’est le composant parent obligatoire pour activer le drag & drop
    // onDragEnd = quand je relâche un élément, j'appelle handleDragEnd
    // collisionDetection = permet de détecter sur quoi on est en train de survoler
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="max-w-md mx-auto mt-8 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Liste de tâches</h2>

        {/* SortableContext permet de gérer l’ordre des éléments */}
        {/* items = liste des ids des tâches, strategy = façon dont on trie verticalement */}
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Je boucle sur chaque tâche et j’affiche une SortableItem pour chaque */}
          {tasks.map((task) => (
            <SortableItem
              key={task.id}
              id={task.id}
              content={task.content}
              position={task.position}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}

// Ce composant affiche une carte déplaçable pour une tâche
function SortableItem({
  id,
  content,
  position,
}: {
  id: string;
  content: string;
  position: number;
}) {
  // useSortable permet de rendre l’élément draggable
  // Il fournit plein d’infos :
  // - attributes : des attributs à mettre dans la div pour l’accessibilité
  // - listeners : les gestionnaires d’événements drag (quand on clique/soulève)
  // - setNodeRef : sert à relier notre élément au système de drag
  // - transform : la position à l’écran pendant le déplacement
  // - transition : l’effet de mouvement (douceur)
  // - isDragging : vrai si l’élément est en train d’être déplacé
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Je crée un style pour déplacer l’élément visuellement
  const style = {
    transform: CSS.Transform.toString(transform), // mouvement pendant le drag
    transition, // effet de transition
    opacity: isDragging ? 0.5 : 1, // si on déplace, l’élément devient semi-transparent
    cursor: "grab", // curseur type "main"
  };

  return (
    // ref = je relie la div au système drag
    // {...attributes} = j’ajoute les attributs nécessaires (accessibilité)
    // {...listeners} = j’ajoute les événements nécessaires pour écouter le drag
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 p-3 bg-white rounded border shadow hover:bg-gray-100 transition"
    >
      {/* Je montre la position (ex: #1) avant le texte */}
      <span className="font-semibold text-gray-700 mr-2">#{position}</span>
      <span>{content}</span>
    </div>
  );
}
