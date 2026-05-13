export type MilestoneCategory =
  | "Motor"
  | "Social"
  | "Communication"
  | "Cognitive";

export type MilestoneItem = {
  id: string;
  month: number;
  category: MilestoneCategory;
  title: string;
  guidance: string;
};

export const milestoneItems: MilestoneItem[] = [
  {
    id: "m1-motor-head",
    month: 1,
    category: "Motor",
    title: "Lifts head briefly during tummy time",
    guidance: "Short, supervised tummy time practice helps build strength.",
  },
  {
    id: "m1-social-face",
    month: 1,
    category: "Social",
    title: "Looks toward familiar faces",
    guidance: "Face-to-face moments during calm wake windows are helpful.",
  },
  {
    id: "m1-communication-sounds",
    month: 1,
    category: "Communication",
    title: "Makes small sounds besides crying",
    guidance: "Soft talking and pauses give baby room to respond.",
  },
  {
    id: "m2-motor-head",
    month: 2,
    category: "Motor",
    title: "Holds head up a little longer",
    guidance: "Keep tummy time brief and frequent if baby tolerates it.",
  },
  {
    id: "m2-social-smile",
    month: 2,
    category: "Social",
    title: "Begins social smiling",
    guidance: "Smiles often show up during calm, alert moments.",
  },
  {
    id: "m2-communication-coo",
    month: 2,
    category: "Communication",
    title: "Starts cooing sounds",
    guidance: "Responding warmly encourages early communication.",
  },
  {
    id: "m3-motor-hands",
    month: 3,
    category: "Motor",
    title: "Brings hands toward mouth",
    guidance: "This is part of baby learning body awareness.",
  },
  {
    id: "m3-cognitive-tracks",
    month: 3,
    category: "Cognitive",
    title: "Watches moving faces or toys",
    guidance: "Slow, simple movement is easiest for baby to follow.",
  },
  {
    id: "m4-motor-roll",
    month: 4,
    category: "Motor",
    title: "May start rolling from tummy to back",
    guidance: "Every baby practices at a different pace.",
  },
  {
    id: "m4-social-laugh",
    month: 4,
    category: "Social",
    title: "Laughs or squeals during play",
    guidance: "Simple playful routines help baby anticipate and respond.",
  },
  {
    id: "m5-motor-reach",
    month: 5,
    category: "Motor",
    title: "Reaches for toys",
    guidance: "Offer safe toys just within reach during awake time.",
  },
  {
    id: "m5-cognitive-explore",
    month: 5,
    category: "Cognitive",
    title: "Explores objects with hands and mouth",
    guidance: "Use clean, baby-safe objects for exploration.",
  },
  {
    id: "m6-motor-sit",
    month: 6,
    category: "Motor",
    title: "Sits with support",
    guidance: "Supported sitting can be practiced for short periods.",
  },
  {
    id: "m6-communication-babble",
    month: 6,
    category: "Communication",
    title: "Babbles with repeated sounds",
    guidance: "Copying baby's sounds can turn practice into play.",
  },
];
