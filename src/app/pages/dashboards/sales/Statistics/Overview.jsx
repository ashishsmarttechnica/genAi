// Import Dependencies
import {
  ArrowUpIcon,
  CubeIcon,
  CurrencyDollarIcon,
  PresentationChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

// Local Imports
import { Avatar, Card } from "components/ui";
import { getCount } from "redux/actions/CountAction";

// ----------------------------------------------------------------------

export function Overview() {
  const dispatch = useDispatch();
  const { count: counts, loading } = useSelector((state) => state.count);

  useEffect(() => {
    if (!counts && !loading) {
      dispatch(getCount());
    }
  }, []);


  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      <Card className="flex justify-between p-5">
        <div>
          <p>Categories</p>
          <p className="this:info mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {counts?.categoryCount || 0}
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>10%</span>
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-xl bg-this/10 text-this dark:bg-this-lighter/20 dark:text-this-lighter">
          <PresentationChartBarIcon className="size-6" />
        </div>
      </Card>

      <Card className="flex justify-between p-5">
        <div>
          <p>prompts</p>
          <p className="this:warning mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {counts?.promptsCount || 0}
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>7.2%</span>
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="warning"
        >
          <UsersIcon className="size-6" />
        </Avatar>
      </Card>

      <Card className="flex justify-between p-5">
        <div>
          <p>users</p>
          <p className="this:success mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {counts?.usersCount || 0}
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>8%</span>
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="success"
        >
          <CubeIcon className="size-6" />
        </Avatar>
      </Card>

      <Card className="flex justify-between p-5">
        <div>
          <p>Revenue</p>
          <p className="this:secondary mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            $128k
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>3.69%</span>
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="secondary"
        >
          <CurrencyDollarIcon className="size-6" />
        </Avatar>
      </Card>
    </div>
  );
}
