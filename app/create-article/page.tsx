import { requireAdminSession } from "@/lib/admin-auth";
import CreateArticleClient from "./CreateArticleClient";

export default async function CreateArticlePage() {
  await requireAdminSession("/create-article");
  const isAfterAiLabelingStart = process.env.AI_LABELING_ACTIVE === "true";

  return <CreateArticleClient isAfterAiLabelingStart={isAfterAiLabelingStart} />;
}
