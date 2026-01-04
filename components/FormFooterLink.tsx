import Link from "next/link";

interface Props {
  text: string;
  linkText: string;
  href: string;
}

function FormFooterLink({ text, linkText, href }: Props) {
  return (
    <div className="text-center p-4">
      <p className="text-sm text-gray-500">
        {text}{" "}
        <Link href={href} className="footer-link">
          {linkText}
        </Link>
      </p>
    </div>
  );
}

export default FormFooterLink;
