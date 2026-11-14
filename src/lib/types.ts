export type Part = { name: string; slug: string; image: string; isYokai: boolean };

export type Evolution = {
  from: Omit<Part, "isYokai">;
  level: string;
  to: Omit<Part, "isYokai">;
} | null;

export type Fusion = { a: Part; b: Part; result: Part };

export type Move = { name: string; power: string; target: string };

export type Moveset = {
  attack: Move;
  technique: Move & { image: string };
  inspirit: Move & { description: string };
  soultimate: Move & { image1: string; image2: string; description: string };
  skill: Move & { description: string };
};

export const emptyMoveset = (): Moveset => ({
  attack: { name: "", power: "", target: "" },
  technique: { name: "", power: "", target: "", image: "" },
  inspirit: { name: "", power: "", target: "", description: "" },
  soultimate: { name: "", power: "", target: "", image1: "", image2: "", description: "" },
  skill: { name: "", power: "", target: "", description: "" },
});

/** Bản rút gọn dùng cho danh sách Medallium */
export type YokaiCard = {
  number: string;
  name: string;
  slug: string;
  rank: string;
  tribe: string;
  attribute: string;
  color: string;
  image: string;
};
