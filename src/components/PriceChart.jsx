import React, { useEffect, useState } from "react";
import axios from "axios";

const PAIR_ADDRESS = "0x14bb16256065ff4abf4a35c2a7c2fdf2a621cd61";
const GRAPH_URL =
  "https://gateway.thegraph.com/api/7f68f66c8d06c225bcf60089a2b6d139/subgraphs/id/EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu";
const PRICE_URL = "https://api.stablz.one/prices/aggregated";

const STATIC_CHART_DATA = [
  { hourStartUnix: 1716768000, reserveUSD: "29000" },
  { hourStartUnix: 1716771600, reserveUSD: "29100" },
  { hourStartUnix: 1716775200, reserveUSD: "29200" },
  { hourStartUnix: 1716778800, reserveUSD: "29300" },
  { hourStartUnix: 1716782400, reserveUSD: "29250" },
  { hourStartUnix: 1716786000, reserveUSD: "29350" },
  { hourStartUnix: 1716789600, reserveUSD: "29400" },
  { hourStartUnix: 1716793200, reserveUSD: "29500" },
  { hourStartUnix: 1716796800, reserveUSD: "29450" },
  { hourStartUnix: 1716800400, reserveUSD: "29550" },
  { hourStartUnix: 1716804000, reserveUSD: "29600" },
  { hourStartUnix: 1716807600, reserveUSD: "29700" },
  { hourStartUnix: 1716811200, reserveUSD: "29650" },
  { hourStartUnix: 1716814800, reserveUSD: "29750" },
  { hourStartUnix: 1716818400, reserveUSD: "29800" },
  { hourStartUnix: 1716822000, reserveUSD: "29900" },
  { hourStartUnix: 1716825600, reserveUSD: "29850" },
  { hourStartUnix: 1716829200, reserveUSD: "29950" },
  { hourStartUnix: 1716832800, reserveUSD: "30000" },
  { hourStartUnix: 1716836400, reserveUSD: "30100" },
  { hourStartUnix: 1716840000, reserveUSD: "30050" },
  { hourStartUnix: 1716843600, reserveUSD: "30150" },
  { hourStartUnix: 1716847200, reserveUSD: "30200" },
  { hourStartUnix: 1716850800, reserveUSD: "30300" },
];
const STATIC_PRICE = "1.0001";

function formatDate(unix) {
  const date = new Date(unix * 1000);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

const PriceChart = () => {
  const [price, setPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [latestDate, setLatestDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch price
        const priceRes = await axios.get(PRICE_URL);
        setPrice(priceRes.data.usdt);

        // Fetch chart data
        const graphRes = await axios.post(GRAPH_URL, {
          query: `
            {
              pairHourDatas(
                first: 24,
                orderBy: hourStartUnix,
                orderDirection: desc,
                where: { pair: "${PAIR_ADDRESS}" }
              ) {
                hourStartUnix
                reserveUSD
              }
            }
          `,
        });

        let data = graphRes.data.data.pairHourDatas;
        // If no data, use static
        if (!data || data.length === 0) {
          data = STATIC_CHART_DATA;
          setPrice(STATIC_PRICE);
        }
        // Sort by ascending time for chart
        data = [...data].sort((a, b) => a.hourStartUnix - b.hourStartUnix);
        setChartData(data);

        // Set latest date
        if (data.length > 0) {
          setLatestDate(formatDate(data[data.length - 1].hourStartUnix));
        }
      } catch (e) {
        // On error, use static data
        setPrice(STATIC_PRICE);
        setChartData(STATIC_CHART_DATA);
        setLatestDate(
          formatDate(
            STATIC_CHART_DATA[STATIC_CHART_DATA.length - 1].hourStartUnix
          )
        );
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Prepare SVG points
  const width = 800,
    height = 200;
  const margin = 20;
  const points = chartData.map((d, i) => ({
    x: margin + (i * (width - 2 * margin)) / (chartData.length - 1),
    y:
      height -
      margin -
      ((parseFloat(d.reserveUSD) -
        Math.min(...chartData.map((c) => parseFloat(c.reserveUSD)))) /
        (Math.max(...chartData.map((c) => parseFloat(c.reserveUSD))) -
          Math.min(...chartData.map((c) => parseFloat(c.reserveUSD))) || 1)) *
        (height - 2 * margin),
  }));

  // SVG path
  const path = points.length
    ? "M" + points.map((p) => `${p.x},${p.y}`).join(" L")
    : "";

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 col-span-2">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <div className="text-white text-4xl font-bold mb-2">
            {loading ? "Loading..." : `$${parseFloat(price).toFixed(4)}`}
          </div>
          <div className="text-gray-400 text-sm">
            {loading ? "" : latestDate}
          </div>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <div className="md:text-right">
            <div className="text-gray-400 text-sm mb-1">STABLZ/USD</div>
            <div className="text-white font-bold">PRICE</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm mb-1"></div>
            <div className="text-gray-500 font-bold">LIQUIDITY</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <button className="w-8 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </button>
          <span className="text-white text-sm font-medium">1D</span>
        </div>
        <span className="text-gray-500 text-sm">1M</span>
      </div>
      <div className="relative h-64 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {points.length > 1 && (
            <>
              <path
                d={path}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                className="animate-pulse"
              />
              <path
                d={
                  path +
                  ` L${width - margin},${height - margin} L${margin},${
                    height - margin
                  } Z`
                }
                fill="url(#chartGradient)"
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default PriceChart;
