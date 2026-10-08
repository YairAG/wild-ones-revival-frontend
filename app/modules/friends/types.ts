/** Un amigo en la lista */
export type Friend = {
  id: number;
  dname: string;
  level: number;
  online: boolean;
};

/** Una solicitud de amistad que te enviaron */
export type FriendRequest = {
  id: number;
  dname: string;
};
