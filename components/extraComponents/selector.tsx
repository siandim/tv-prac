//app/components/selector
import React from "react";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import "./styles.css";

interface SelectorProps {
  label: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}

const Selector = (props: SelectorProps) => {
  return (
    <div>
      <Select.Root onValueChange={props.onChange}>
        <Select.Trigger className="SelectTrigger" aria-label="Sources">
          <Select.Value placeholder={props.placeholder} />
          <Select.Icon className="SelectIcon">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="SelectContent">
            <Select.ScrollUpButton className="SelectScrollButton">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport className="SelectViewport">
              <Select.Group>
                <Select.Label className="SelectLabel">
                  {props.label}
                </Select.Label>
                {props.options.map((option) => (
                  <Select.Item
                    key={option.value}
                    className="SelectItem"
                    value={option.value}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="SelectItemIndicator">
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton className="SelectScrollButton">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default Selector;
