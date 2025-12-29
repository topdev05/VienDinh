"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, getAuthOrSignIn } from "@/lib/auth";
import { db, orm, schema } from "@/lib/db";
import { invariant } from "@esmate/utils";

export async function deletePostAction(formData: FormData) {
  const me = await getAuthOrSignIn("/dashboard/posts");

  const permission = await auth.api.userHasPermission({
    body: {
      userId: me.id,
      permission: {
        posts: ["delete any", "delete own"],
      },
    },
  });

  invariant(permission.success, "You don't have permission to delete this post");

  const id = formData.get("id") as string;
  invariant(id, "Post ID is required");

  const post = await db.query.post.findFirst({
    where: orm.eq(schema.post.id, id),
  });

  invariant(post, "Post not found");

  await db.delete(schema.post).where(orm.eq(schema.post.id, id));

  revalidatePath("/dashboard/posts");
  redirect("/dashboard/posts");
}
