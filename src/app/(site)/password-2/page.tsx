import type { Metadata } from "next";
import { PasswordRegionList } from "@/components/site/PasswordPages";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("PW Yo-kai Watch 2") };

export default function Password2Page() {
  return <PasswordRegionList game={2} />;
}
