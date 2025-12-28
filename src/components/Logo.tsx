import Image from "next/image";

export const Logo = ({
  className,
  size = 192,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <Image
      src="/images/logo-192x192.png"
      alt="Từ Điển Tiếng Việt"
      width={size}
      height={size}
      className={className}
    />
  );
};
