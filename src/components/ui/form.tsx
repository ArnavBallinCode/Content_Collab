"use client";

import * as React from "react";
import { useFormContext, Controller, FormProvider } from "react-hook-form";

export function Form({ children, ...props }: any) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormField({ name, render }: { name: string; render: any }) {
  const methods = useFormContext();
  return <Controller name={name} control={methods.control} render={render} />;
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block mb-1 font-medium">{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  return children ? <p className="text-sm text-red-600 mt-1">{children}</p> : null;
}

export { FormProvider };

/**
 * Note: The Form component now provides FormProvider context for all children.
 * Use <Form {...form}>{...}</Form> in your pages/components.
 */
