import { requireAdminSession } from "@/lib/admin-auth";
import CreateArticleClient from "./CreateArticleClient";

export default async function CreateArticlePage() {
  await requireAdminSession("/create-article");

  return <CreateArticleClient />;
}
