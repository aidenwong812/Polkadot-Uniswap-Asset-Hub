import { t } from "i18next";
import Button from "../../atom/Button";

export type FallbackProps = {
  error: Error | undefined;
  resetErrorBoundary: () => void;
};

const PageError = ({ error, resetErrorBoundary }: FallbackProps) => {
  const onReset = () => {
    resetErrorBoundary();
  };

  return (
    <div>
      {t("pageError.error")} <pre>{error?.message}</pre>
      <div>
        <Button onClick={onReset}>{t("pageError.tryAgain")}</Button>
      </div>
    </div>
  );
};

export default PageError;
