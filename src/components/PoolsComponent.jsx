import React from "react";
import MetricCard from "./MetricCard";
import im1 from "../assets/im1.png";
import im2 from "../assets/im2.png";
import im3 from "../assets/im3.png";
import im4 from "../assets/im4.png";
import im5 from "../assets/im5.png";
import im6 from "../assets/im6.png";
import im7 from "../assets/im7.png";

const PoolsContent = () => {
  const poolsData = [
    {
      id: 1,
      name: "USDD-3CRV",
      vApy: "0%",
      tvl: "$0",
      capital: "≈$0.00",
      rewards: "≈$0.00",
      im1: im1,
      im2: im2,
      im3: im3,
      im4: im4,
    },
    {
      id: 2,
      name: "PWRD-3CRV",
      vApy: "0%",
      tvl: "$0",
      capital: "≈$0.00",
      rewards: "≈$0.00",
      im1: im5,
      im2: im2,
      im3: im3,
      im4: im4,
    },
    {
      id: 3,
      name: "FRAX-3CRV",
      vApy: "0%",
      tvl: "$0",
      capital: "≈$0.00",
      rewards: "≈$0.00",
      im1: im6,
      im2: im2,
      im3: im3,
      im4: im4,
    },
    {
      id: 4,
      name: "MIM-3CRV",
      vApy: "0%",
      tvl: "$0",
      capital: "≈$0.00",
      rewards: "≈$0.00",
      im1: im7,
      im2: im2,
      im3: im3,
      im4: im4,
    },
  ];

  const stock = [
    {
      title: "Total Capital",
      value: "$0.00",
    },
    {
      title: "Total Rewards",
      value: "$0.00",
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      {/* Top Metrics */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        {stock.map((item) => (
          <MetricCard key={item.title} title={item.title} value={item.value} />
        ))}
      </div>

      {/* Pools Table */}
      <div className="bg-black rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 xl:grid-cols-8 gap-2 p-2 sm:p-4 text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
          <div className="col-span-2"></div>
          <div className="col-span-1">vAPY</div>
          <div className="col-span-1">TVL</div>
          <div className="hidden md:block col-span-1">Capital</div>
          <div className="hidden md:block col-span-1">Rewards</div>
          <div className="hidden xl:block col-span-2"></div>{" "}
          {/* Placeholder for buttons on xl */}
        </div>

        {/* Table Rows */}
        {poolsData.map((pool) => (
          <div
            key={pool.id}
            className="bg-[#090809] my-2 grid grid-cols-4 xl:grid-cols-8 gap-2 p-2 items-center hover:bg-gray-800/30 transition-colors md:p-[20px_30px] rounded-lg"
          >
            {/* Pool Name & Icon */}
            <div className="col-span-2 flex items-center gap-4 md:gap-6">
              <div className="relative w-20 sm:w-24 h-8 sm:h-10">
                <div className="absolute w-8 h-8  rounded-full border-2 border-gray-700 bg-white left-0 z-10">
                  <img
                    src={pool.im1}
                    alt="Icon 1"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute w-8 h-8  rounded-full border-2 border-gray-700 bg-white left-2 sm:left-4 z-20">
                  <img
                    src={pool.im2}
                    alt="Icon 2"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute w-8 h-8  rounded-full border-2 border-gray-700 bg-white left-8 sm:left-8 z-30">
                  <img
                    src={pool.im3}
                    alt="Icon 3"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute w-8 h-8  rounded-full border-2 border-gray-700 bg-white left-12 sm:left-15 z-40">
                  <img
                    src={pool.im4}
                    alt="Icon 4"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-white text-sm sm:text-base font-medium">
                {pool.name}
              </span>
            </div>

            {/* vAPY */}
            <div className="col-span-1 flex items-center">
              <span className="text-green-400 text-sm sm:text-base font-medium">
                {pool.vApy}
              </span>
            </div>

            {/* TVL */}
            <div className="col-span-1 flex items-center">
              <span className="text-white text-sm sm:text-base">
                {pool.tvl}
              </span>
            </div>

            {/* Capital (visible on all screens) */}
            <div className="col-span-1 flex items-center">
              <span className="text-white text-sm sm:text-base">
                {pool.capital}
              </span>
            </div>

            {/* Rewards (visible on all screens) */}
            <div className="col-span-1 flex items-center">
              <span className="text-white text-sm sm:text-base">
                {pool.rewards}
              </span>
            </div>

            {/* Buttons (full width on smaller screens, same line on xl) */}
            <div className="col-span-4 xl:col-span-2 flex flex-wrap justify-center xl:justify-end items-center gap-2 mt-2 xl:mt-0">
              <div className="flex rounded-full py-[5px] bg-[#111011]">
                <button className="px-4 py-1 text-xs font-medium text-gray-400 rounded hover:border-gray-500 hover:text-white transition-colors">
                  DEPOSIT
                </button>
                <button className="px-4 py-1 text-xs font-medium text-gray-400 rounded hover:border-gray-500 hover:text-white transition-colors">
                  WITHDRAW
                </button>
              </div>
              <button className="px-4 py-1 text-xs font-medium text-gray-400 rounded hover:border-gray-500 hover:text-white transition-colors">
                CLAIM
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolsContent;
