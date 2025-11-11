import { useEffect, useRef } from "react";
import { Skeleton } from "antd";
import type { BlobDisplayProps } from "@/types/blob";

const AudioDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && contents) {
      audioRef.current.src = URL.createObjectURL(contents);
    }
  }, [audioRef, contents]);

  return (
    <>
      <Skeleton active={true} loading={loading} title={false} paragraph={{ rows: 1 }} />
      {!loading && <audio className="bfd--w-full" ref={audioRef} controls={true} />}
    </>
  );
};

export default AudioDisplay;
