import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldCurrency',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    balance: z.number(),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="currency"
            name="balance"
            label="Balance"
            placeholder={12}
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};

export const InCents = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="currency"
            name="balance"
            label="Balance"
            inCents
            placeholder={1200}
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};

export const LocaleFr = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="currency"
            name="balance"
            label="Balance"
            locale="fr"
            placeholder={12}
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};

export const LocaleNoDecimals = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="currency"
            name="balance"
            label="Balance"
            decimals={0}
            placeholder={12}
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="currency"
            name="balance"
            label="Balance"
            placeholder={12}
            isDisabled
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};
