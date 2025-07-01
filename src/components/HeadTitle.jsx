import Head from "next/head";
import { store } from "../store/store";
import { getHeaderTitle } from "@/helpers/functionHelper";

export const HeadTitle = ({ title }) => {
  const meta_description =
    store.getState().settings.value?.web_settings?.[0]?.meta_description || "";
  const meta_keywords =
    store.getState().settings.value?.web_settings?.[0]?.meta_keywords || "";

  return (
    <Head>
      <title>{getHeaderTitle(title)}</title>
      <meta name="description" content={meta_description} />
      <meta name="keywords" content={meta_keywords} />
    </Head>
  );
};
