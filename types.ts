
// Define Position as a string type for flexibility in naming roles
export type Position = string;

export interface Candidate {
  id: string;
  name: string;
  bio: string;
  // Added optional fields for extended component support
  imageUrl?: string;
  position?: Position;
  experience?: string;
  manifesto?: string;
}

export interface TallyState {
  votes: { [candidateId: string]: number };
  invalid: number;
  totalDistributed: number;
}
