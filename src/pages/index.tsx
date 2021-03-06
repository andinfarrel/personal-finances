// import PieChart from "@/components/PieChart";

import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";

import {
  FC,
  FormEventHandler,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

const Home: NextPage = () => {
  const [groups, setGroups] = useState([{ groupId: uuidv4(), label: "Finance Sheet 1" }]);
  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.groupId !== groupId))
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Head>
        <title>Personal Finances Calculator</title>
        
      </Head>
      <div className="my-auto p-4 sm:p-8 md:p-36 rounded-lg flex flex-col space-y-8">
        {groups.map((group, index) => (
          <GroupContainer key={index} label={group.label} id={group.groupId} handleDeleteGroup={handleDeleteGroup}/>
        ))}
        <div className="my-auto mx-auto">
          <button onClick={() => setGroups([...groups, { groupId: uuidv4(), label: `Finance Sheet ${groups.length + 1}` }])} className="text-slate-50 px-4 py-2 aspect-square  bg-slate-800 rounded-xl text-4xl">+</button>
        </div>
      </div>
    </div>
  );
};

interface ListItem {
  rowId: string;
  name: string;
  amount: number;
  type: "add" | "deduct";
}

const GroupContainer: FC<{
  id: string;
  label: string;
  handleDeleteGroup: (groupId: string) => void;
}> = ({ label, handleDeleteGroup, id }) => {
  const [listItems, setListItems] = useState<ListItem[]>([{ rowId: uuidv4(), name: "example", amount: 400, type: "add" }]);
  const listVals = Object.values(listItems);
  const pieData = listVals.map((val) => ({ name: val.name, value: val.amount }));
  
  const cummulative = listVals.reduce((acc, item) => {
    if (item.type === "add") return acc + item.amount;
    return acc - item.amount;
  }, 0).toFixed(2);

  const handleAddRow: MouseEventHandler<HTMLButtonElement> = () => {
    setListItems(prev => ([
      ...prev,
      { rowId: uuidv4(), name: "", amount: 0, type: "add" }
    ]));
  };

  const handleDeleteRow = (rowId: string) => {
    setListItems(prev => prev.filter(item => item.rowId !== rowId));
  }

  const handleRowChange = (rowId: string) => (vals: ListItem) => {
    setListItems((prev) => {
      const idx = prev.findIndex(item => item.rowId === rowId);
      if (idx === -1) return prev;
      const newList = [...prev];
      newList[idx] = vals;
      return newList;
    });
  };
  

  return (
    <div className="mx-auto bg-slate-50 w-full max-w-xl flex flex-col space-y-4 rounded-lg p-4 d:p-8">
      <div className="flex justify-between py-4">
        <p className="text-xl font-semibold italic hover:cursor-pointer">{label}</p>
        <button onClick={() => handleDeleteGroup(id)} className="text-red-500">Delete</button>
      </div>
      <form className="flex flex-col space-y-4">
        {listItems &&
          Object.entries(listItems).map(([index, rowValues]) => (
            <Row
              rowValues={rowValues}
              key={rowValues.rowId}
              handleDeleteRow={handleDeleteRow}
              handleRowChange={handleRowChange(rowValues.rowId)}
            />
          ))}
      </form>
      <p>Cummulative Sum: {cummulative}</p>
      <button
        onClick={handleAddRow}
        className="bg-black text-slate-50 rounded-lg px-4 py-2"
      >
        Add row
      </button>
    </div>
  );
};

const Row: FC<{
  rowValues: ListItem;
  handleDeleteRow: (rowId: string) => void;
  handleRowChange: (vals: ListItem) => void;
}> = ({ rowValues, handleDeleteRow, handleRowChange }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <div className="relative flex">
      <div onClick={() => setIsOptionsOpen(prev => !prev)} className="cursor-pointer my-auto text-slate-800 pr-3">
        &#8942;
      </div>
      { isOptionsOpen && (
        <button onClick={() => handleDeleteRow(rowValues.rowId)} className="absolute bg-slate-50 hover:bg-red-200 p-2 left-4 top-0 shadow-xl rounded-md z-10">
          delete
        </button>
      )}
      <div className="grid grid-flow-col grid-cols-5 grid-rows-2 md:grid-rows-1 gap-2">
        <input
          onChange={(e) =>
            handleRowChange({
              ...rowValues,
              name: e.target.value,
            })
          }
          value={rowValues.name}
          className="col-span-5 md:col-span-2 p-2 border-2 bg-slate-200 rounded-lg shadow-xs"
          placeholder="name"
          type="text"
        />
        <input
          className="col-span-3 md:col-span-2 p-2 border-2 bg-slate-200 rounded-lg shadow-xs"
          placeholder={"0"}
          type="number"
          onChange={(e) => {
            handleRowChange({
              ...rowValues,
              amount: e.target.value ? parseFloat(e.target.value) : 0,
            });
          }}
          value={(() => {
            const strVal = rowValues.amount.toString();
            return strVal.charAt(0) === "0"
              ? strVal.substring(0, strVal.length)
              : strVal;
          })()}
        />
        <select
          className={clsx("col-span-2 md:col-span-1 p-2 rounded-lg bg-green-300 ring-0 shadow-xs", {
            "bg-red-300 ring-0": rowValues.type === "deduct",
          })}
          onChange={(e) =>
            handleRowChange({
              ...rowValues,
              type: e.target.value as ListItem["type"],
            })
          }
          value={rowValues.type}
        >
          <option value="add">Add</option>
          <option value="deduct">Deduct</option>
        </select>
      </div>
    </div>
  );
};

export default Home;
