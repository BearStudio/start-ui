import { ReactNode } from 'react';

import {
  Flex,
  FlexProps,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldRadiosProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'radios';
  label?: ReactNode;
  helper?: ReactNode;
  rowGap?: FlexProps['rowGap'];
  columnGap?: FlexProps['columnGap'];
  direction?: FlexProps['direction'];
  options?: Readonly<
    Readonly<{
      label: string;
      value: PathValue<TFieldValues, TName>[number];
    }>[]
  >;
  children?: ReactNode;
} & Pick<RadioGroupProps, 'size'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldRadios = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldRadiosProps<TFieldValues, TName>
) => {
  const getMinHeight = () => {
    if (props.layout !== 'row') return;
    if (props.size === 'lg') return 12;
    if (props.size === 'md') return 10;
    if (props.size === 'sm') return 8;
  };

  return (
    <Controller
      {...props}
      render={({ field: { ref: _ref, ...field } }) => (
        <FormFieldItem>
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          <Flex direction="column" gap={1.5}>
            <RadioGroup size={props.size} {...field}>
              {!!props.options && (
                <Flex
                  columnGap={props.columnGap ?? 4}
                  rowGap={props.rowGap ?? 1.5}
                  direction={props.direction ?? props.layout ?? 'column'}
                  minH={getMinHeight()}
                >
                  {props.options.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Flex>
              )}
              {props.children}
            </RadioGroup>
            <FormFieldError />
          </Flex>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
        </FormFieldItem>
      )}
    />
  );
};
