import { Box, Button, Input, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldController } from '@/components/Form/FormFieldController';
import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField, FormFieldError, FormFieldLabel } from './';

export default {
  title: 'Form/Form',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
    email: zu.string.emailNullish(z.string(), {
      required_error: 'Email is required',
      invalid_type_error: 'Email is invalid',
    }),
    color: z.enum(['red', 'green', 'blue']),
    other: zu.string.nonEmptyNullish(z.string()),
  });

export const Default = () => {
  const form = useForm<FormSchema>({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      email: '',
      color: undefined,
      other: '',
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (values) => {
    console.log(values);
  };

  return (
    <Form {...form} onSubmit={onSubmit}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="text"
          name="name"
          label="Name"
        />

        <FormField
          control={form.control}
          type="email"
          name="email"
          optionalityHint="optional"
          label="Email"
        />

        <FormField
          control={form.control}
          type="select"
          name="color"
          label="Color"
          options={[
            {
              label: 'Red',
              value: 'red',
            },
            {
              label: 'Green',
              value: 'green',
            },
            {
              label: 'Blue',
              value: 'blue',
            },
          ]}
        />

        <FormField
          control={form.control}
          name="other"
          type="custom"
          optionalityHint="optional"
          render={({ field }) => (
            <>
              <FormFieldLabel>Other (Custom)</FormFieldLabel>
              <Input {...field} value={field.value ?? ''} />
              <FormFieldError name="other" control={form.control} />
            </>
          )}
        />

        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};

export const NoHtmlForm = () => {
  const form = useForm<FormSchema>({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      email: '',
      color: undefined,
      other: '',
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (values) => {
    console.log(values);
  };

  return (
    <Form {...form} noHtmlForm>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormField label="Name">
            <FormFieldController
              control={form.control}
              type="text"
              name="name"
            />
          </FormField>

          <FormField optionalityHint="optional" label="Email">
            <FormFieldController
              control={form.control}
              type="email"
              name="email"
            />
          </FormField>

          <FormField label="Color">
            <FormFieldController
              control={form.control}
              type="select"
              name="color"
              options={[
                {
                  label: 'Red',
                  value: 'red',
                },
                {
                  label: 'Green',
                  value: 'green',
                },
                {
                  label: 'Blue',
                  value: 'blue',
                },
              ]}
            />
          </FormField>

          <FormField
            control={form.control}
            name="other"
            type="custom"
            optionalityHint="optional"
            render={({ field }) => (
              <>
                <FormFieldLabel>Other (Custom)</FormFieldLabel>
                <Input {...field} value={field.value ?? ''} />
                <FormFieldError name="other" control={form.control} />
              </>
            )}
          >
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              optionalityHint="optional"
              render={({ field }) => (
                <>
                  <FormFieldLabel>Other (Custom)</FormFieldLabel>
                  <Input {...field} value={field.value ?? ''} />
                  <FormFieldError name="other" control={form.control} />
                </>
              )}
            />
          </FormField>

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
