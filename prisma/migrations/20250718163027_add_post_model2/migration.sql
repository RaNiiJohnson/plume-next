-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
