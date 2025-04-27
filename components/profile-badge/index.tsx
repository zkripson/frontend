import Image from "next/image";

const KPProfileBadge = ({ username, avatarUrl }: IKPProfileBadge) => {
  return (
    <div className="flex items-center bg-primary-450 border border-primary-300 rounded-full px-2 py-2.5 justify-between w-full max-w-[200px]">
      <div className="flex items-center gap-2">
        <Image
          src={avatarUrl || "/images/kripson.jpeg"}
          alt={username}
          width={300}
          height={300}
          className="size-8 rounded-full object-cover"
          quality={100}
        />

        <span className="text-primary-300 text-[14px] leading-none">
          @{username}
        </span>
      </div>

      <div className="flex-shrink-0">
        <Image
          src="/images/farcaster.png"
          alt="farcaster"
          width={32}
          height={32}
          quality={100}
          className="size-8 object-cover rounded-full"
        />
      </div>
    </div>
  );
};

export default KPProfileBadge;
