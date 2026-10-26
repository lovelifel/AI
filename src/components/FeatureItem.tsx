type FeatureItemProps = {
  title: string;
  description: string;
};
export default function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <li>
      <h2 className="font-semibold text-black dark:text-white">{title}</h2>
      <p>{description}</p>
    </li>
  );
}
