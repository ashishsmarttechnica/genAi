import { CategoryTableRow } from 'app/pages/dashboards/category/CategoryTable';
import * as ReactWindow from 'react-window';
const { List } = ReactWindow;

// Row rendering function inside main component (for better scope)
const CategoryRow = ({ index, style, data }) => {
    // console.log("Rendering Row Index:", index);
    const item = data[index];
    return (
        <div style={style} className="px-2 border-b border-gray-100/10">
            <CategoryTableRow category={item} />
        </div>
    );
};


export default function ListComponent({ categories }) {
    // console.log("ListComponent received data:", categories?.length);

    if (!categories || categories.length === 0) {
        return <div className="p-4 text-center">No data found</div>;
    }

    return (
        <div className="w-full bg-white dark:bg-dark-900 rounded-xl overflow-hidden">
            {/* V2 List needs rowCount and rowHeight. Using style prop for dimensions is safer in v2. */}
            <List
                style={{ height: 'calc(100vh - 16.25rem)', width: '100%' }}
                rowCount={categories.length}
                rowHeight={66}
                rowComponent={CategoryRow}
                rowProps={{ data: categories }}
            />
        </div>
    );
}
