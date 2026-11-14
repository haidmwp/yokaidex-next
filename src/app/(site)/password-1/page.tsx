import type { Metadata } from "next";
import { PasswordRegionList } from "@/components/site/PasswordPages";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("PW Yo-kai Watch 1") };

export default function Password1Page() {
  return <PasswordRegionList game={1} />;
}
