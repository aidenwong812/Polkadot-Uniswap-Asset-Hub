import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

import { useLocation, useParams } from "react-router-dom";
import { SEO_ROUTES } from "../../../app/router/routes";

const SeoHelmet: FC = () => {
  const { t } = useTranslation();

  const params = useParams();
  const location = useLocation();
  const replace = Object.keys(params).map((item) => {
    return location.pathname?.replace(`/${params?.[item]}`, `/:${item}`);
  });

  const myLocation = replace.length > 0 ? replace?.[0] : location.pathname;

  const { title, description } = SEO_ROUTES[myLocation as keyof typeof SEO_ROUTES] || {
    title: "DOT ACP Page",
    description: "DOT ACP Page Description",
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={t("seo.global.keywords")} />

      <meta property="og:title" content={t("seo.og.title")} />
      <meta property="og:description" content={t("seo.og.title")} />
      <meta property="og:image" content={t("seo.og.image")} />
      <meta property="og:url" content={t("seo.og.url")} />

      <meta name="twitter:card" content={t("seo.twitter.card")} />
      <meta name="twitter:title" content={t("seo.twitter.title")} />
      <meta name="twitter:description" content={t("seo.twitter.description")} />
      <meta name="twitter:image" content={t("seo.twitter.image")} />
    </Helmet>
  );
};

export default SeoHelmet;
