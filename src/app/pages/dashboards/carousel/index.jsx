import { Page } from "components/shared/Page";
import CarouselList from "./CarouselList";

export default function Carousel() {
    return (
        <Page title="Carousel">
            <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
                <CarouselList />
            </div>
        </Page>
    );
}
