import { useState, useMemo, useEffect } from 'react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from '@headlessui/react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const SelectFieldHeader = ({
  label,
  name,
  register,
  options = [],
  error,
  placeholder = 'Select',
  onChange,
  value: externalValue,
  showAllOption = true, // New prop to control "All" option visibility
}) => {
  const [query, setQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(externalValue || '');
  
  const { onChange: rhfOnChange, name: rhfName } = register(name);

  useEffect(() => {
    if (externalValue !== undefined) {
      setSelectedValue(externalValue);
    }
  }, [externalValue]);

  // Add "All" option at the beginning if enabled
  const optionsWithAll = useMemo(() => {
    if (!showAllOption) return options;
    // Create contextual "All" text from placeholder (e.g., "Country" -> "All Countries")
    const allText = placeholder.startsWith('Select ') 
      ? `All ${placeholder.replace('Select ', '')}`
      : `All ${placeholder}`;
    return [{ label: allText, value: '' }, ...options];
  }, [options, showAllOption, placeholder]);

  const filteredOptions = useMemo(() => {
    const search = query.toLowerCase().trim();
    if (!search) return optionsWithAll;
    return optionsWithAll.filter((option) =>
      option.label.toLowerCase().includes(search)
    );
  }, [query, optionsWithAll]);

  const selectedOption = useMemo(() => 
    optionsWithAll.find((opt) => String(opt.value) === String(selectedValue)),
    [optionsWithAll, selectedValue]
  );

  return (
    <div className="relative w-full group">
      {label && (
        <label className="mb-2 block text-sm font-bold tracking-tight text-slate-700 transition-colors group-focus-within:text-primary ml-1">
          {label}
        </label>
      )}

      <Combobox
        as="div"
        value={selectedValue}
        onChange={(val) => {
          setSelectedValue(val || '');
          const event = {
            target: { name: rhfName, value: val || '' },
            type: 'change',
          };
          rhfOnChange(event);
          if (onChange) onChange(event);
        }}
        modal={false}
        immediate
      >
        <div className="relative">
          <ComboboxButton className="w-full text-left outline-none block">
            <div 
              className={`
                relative flex items-center h-11 md:h-[56px] w-full 
                overflow-hidden rounded-xl md:rounded-2xl border 
                transition-all duration-300 ease-out
                bg-white/95 backdrop-blur-xl shadow-sm
                ${error 
                  ? 'border-red-400 ring-2 ring-red-500/10' 
                  : 'border-slate-200/80 hover:border-primary/40 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10'
                }
              `}
            >
              <div className="absolute left-4 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-400" strokeWidth={2.5} />
              </div>

              <ComboboxInput
                className="h-full w-full border-none bg-transparent py-2 pl-10 md:pl-11 pr-12 text-[13px] md:text-sm font-semibold text-slate-800 placeholder-slate-500 focus:ring-0 outline-none"
                displayValue={() => selectedOption?.label || ''}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                onClick={(e) => e.target.select()}
              />

              <div className="absolute right-3.5 flex items-center gap-2 pointer-events-none">
                <div className="h-4 w-px bg-slate-200 mx-0.5" />
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className="text-slate-400 transition-transform duration-300 group-data-open:rotate-180"
                />
              </div>
            </div>
          </ComboboxButton>

          {/* Clear button positioned absolutely, outside ComboboxButton */}
          {selectedValue !== '' && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Clear to empty string - this selects "All" option if showAllOption is true
                setSelectedValue('');
                const clearEvent = { 
                  target: { name: rhfName, value: '' }, 
                  type: 'change',
                  currentTarget: { name: rhfName, value: '' }
                };
                rhfOnChange(clearEvent);
                if (onChange) {
                  onChange(clearEvent);
                }
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
            >
              <X size={14} strokeWidth={2.5} />
            </div>
          )}

          <Transition
            enter="transition transform ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1 scale-[0.98]"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition transform ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-1 scale-[0.98]"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions 
              className="
                absolute z-100 mt-2 max-h-64 w-full overflow-auto 
                rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] 
                ring-1 ring-slate-200/60 focus:outline-none 
                custom-scrollbar
              "
            >
              {filteredOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <Search className="text-slate-300" size={18} />
                  </div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">No results found</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredOptions.map((option) => (
                    <ComboboxOption
                      key={option.value || 'all'}
                      value={option.value}
                      className={({ focus, selected }) => `
                        group relative cursor-pointer select-none rounded-[10px] 
                        py-2.5 pl-9 pr-4 transition-all duration-200
                        ${focus ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]' : 'text-slate-700 hover:bg-slate-50'}
                        ${selected && !focus ? 'bg-primary/5 text-primary font-bold' : ''}
                        ${option.value === '' && !selected && !focus ? 'bg-slate-50/50 font-bold text-slate-600' : ''}
                      `}
                    >
                      {({ selected, focus }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-bold' : option.value === '' ? 'font-bold' : 'font-semibold'} text-[13px] md:text-sm`}>
                            {option.label}
                          </span>
                          {selected && (
                            <span className={`absolute inset-y-0 left-2.5 flex items-center transition-colors ${focus ? 'text-white' : 'text-primary'}`}>
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  ))}
                </div>
              )}
            </ComboboxOptions>
          </Transition>
        </div>

        {error && (
          <p className="mt-2 ml-1 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
            {error.message}
          </p>
        )}
      </Combobox>
    </div>
  );
};

export default SelectFieldHeader;
