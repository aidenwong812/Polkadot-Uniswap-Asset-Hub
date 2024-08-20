import { t } from "i18next";

const Footer = () => {
  return (
    <>
      <div className="flex-grow" />
      <footer className="bg-purple-200">
        <div className="relative flex items-center justify-center py-[9px]">
          <p className="text-tokens-label text-medium font-normal tracking-[0.20px] opacity-80">
            <span className="text-gray-400">{t("footer.poweredBy")} |&nbsp;</span>
            <a href="https://mvpworkshop.co/" rel="noopener noreferrer" target="_blank">
              <span className="text-purple-400 underline">{t("footer.company")}</span>
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
