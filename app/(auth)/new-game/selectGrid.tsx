import classNames from "classnames";

const SelectGrid = <T extends string | number>({
  title,
  options,
  selected,
  onSelect,
  height,
}: SelectGridProps<T>) => (
  <div className="flex flex-col gap-2 w-full">
    <h1 className="text-[26px] leading-none text-primary-50 font-MachineStd">
      {title}
    </h1>

    <div className="w-full grid grid-cols-3 gap-2">
      {options.map((option) => (
        <div
          key={option}
          className={classNames(
            `${height} px-6 rounded-[4px] bg-primary-250 flex flex-col items-center justify-center gap-2.5 transition-all duration-500 cursor-pointer hover:rounded-xl hover:shadow-[0px_4px_0px_0px_#5D656E]`,
            {
              "border-primary-350 border": selected !== option,
              "border-primary-200 border-[4px]": selected === option,
            }
          )}
          style={{
            boxShadow: `inset 0px 4px 0px 0px #5D656E`,
          }}
          onClick={() => onSelect(option)}
        >
          {typeof option === "string" && (
            <h2 className="text-[20px] font-medium leading-none text-white">
              {option}
            </h2>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default SelectGrid;
