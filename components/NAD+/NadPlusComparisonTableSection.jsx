import NadPlusComparisonTable from "./NadPlusComparisonTable";
import {
    NAD_PLUS_COMPARISON_COLUMNS,
    NAD_PLUS_COMPARISON_CRITERIA,
    NAD_PLUS_COMPARISON_HEADER,
} from "./nadPlusComparisonData";

export default function NadPlusComparisonTableSection({
    header = NAD_PLUS_COMPARISON_HEADER,
    criteria = NAD_PLUS_COMPARISON_CRITERIA,
    columns = NAD_PLUS_COMPARISON_COLUMNS,
}) {
    return (
        <section className="w-full bg-white px-4 py-12 md:py-16 lg:py-20">
            <NadPlusComparisonTable
                header={header}
                criteria={criteria}
                columns={columns}
            />
        </section>
    );
}
