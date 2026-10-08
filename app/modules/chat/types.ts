/** Un mensaje del chat global */
export type ChatMessage = {
  id: number;
  dname: string; // quién lo escribió
  text: string;
  time: string; // HH:MM
};
