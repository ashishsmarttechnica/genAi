import { Page } from "components/shared/Page";
import CategoryList from "./CategoryList";

export default function Category() {
  return (
    <Page title="Category">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <CategoryList />
      </div>
    </Page>
  );
}
