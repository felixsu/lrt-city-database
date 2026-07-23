"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoThumbnailUrl } from "@/lib/video-thumbnail";
import type { TimelineMediaFormState } from "./actions";

type MediaItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
};

type AddMediaAction = (
  prevState: TimelineMediaFormState,
  formData: FormData,
) => Promise<TimelineMediaFormState>;

export function TimelineMediaGallery({
  timelineEventId,
  media,
  addAction,
  deleteAction,
}: {
  timelineEventId: string;
  media: MediaItem[];
  addAction: AddMediaAction;
  deleteAction: (formData: FormData) => void;
}) {
  const [state, formAction, pending] = useActionState<TimelineMediaFormState, FormData>(
    addAction,
    { error: null },
  );

  return (
    <div>
      {media.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {media.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1">
              <div className="relative h-20 w-20 overflow-hidden rounded-md bg-surface-soft">
                <Image
                  src={item.type === "VIDEO" ? getVideoThumbnailUrl(item.url) : item.url}
                  alt=""
                  fill
                  className="object-cover"
                />
                {item.type === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                )}
              </div>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="timelineEventId" value={timelineEventId} />
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input type="hidden" name="timelineEventId" value={timelineEventId} />
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            multiple
            required
            className="text-xs"
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Uploading..." : "Add media"}
          </Button>
        </div>
        <p className="text-xs text-muted">Photos and videos, up to 10MB each.</p>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
