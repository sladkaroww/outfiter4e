"use client";

import {
  Avatar,
  Button,
  Field,
  IconButton,
  Input,
  NativeSelect,
  Skeleton,
  Tag,
  Textarea,
  type AvatarProps,
  type ButtonProps,
  type FieldRootProps,
  type IconButtonProps,
  type InputProps,
  type NativeSelectRootProps,
  type SkeletonProps,
  type TagProps,
  type TextareaProps,
} from "@yamada-ui/react";
import type { ReactNode } from "react";
import NextLink from "next/link";

/** Design tokens shared by every Yamada UI wrapper. */
export const COLORS = {
  ink: "#171615",
  muted: "#77736d",
  cream: "#f6f3ee",
  paper: "#fffdfa",
  line: "#ded9d1",
  orange: "#ec6f42",
  danger: "#c4472d",
  placeholder: "#9b968f",
} as const;

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const buttonVariants: Record<ButtonVariant, ButtonProps> = {
  primary: {
    bg: COLORS.ink,
    color: "#fff",
    border: "1px solid transparent",
    _hover: { bg: COLORS.orange, transform: "translateY(-1px)" },
    _active: { bg: "#d95f34" },
    _disabled: { bg: COLORS.ink, opacity: 0.55, transform: "none" },
  },
  secondary: {
    bg: "transparent",
    color: COLORS.ink,
    border: "1px solid " + COLORS.ink,
    _hover: { bg: "white" },
    _disabled: { opacity: 0.5 },
  },
  ghost: {
    bg: "transparent",
    color: COLORS.muted,
    border: "1px solid transparent",
    _hover: { color: COLORS.ink, bg: "transparent" },
  },
  danger: {
    bg: COLORS.danger,
    color: "#fff",
    border: "1px solid " + COLORS.danger,
    _hover: { bg: "#a83a24" },
  },
};

const buttonSizes: Record<ButtonSize, ButtonProps> = {
  sm: { px: "4", py: "2.5", fontSize: "13px" },
  md: { px: "5.5", py: "3.5", fontSize: "15px" },
};

export type AppButtonProps = Omit<ButtonProps, "variant" | "size"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** When set, the button renders as a Next.js link. */
  href?: string;
};

/**
 * Yamada `Button` styled as the app's pill buttons. Links use the `as` prop
 * instead of `asChild` because Yamada's Button renders internal slots.
 */
export function AppButton({ variant = "primary", size = "md", fullWidth, href, ...rest }: AppButtonProps) {
  const styles = {
    rounded: "full",
    fontWeight: "700",
    lineHeight: "1.1",
    height: "auto",
    minH: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    transition: "0.2s",
    w: fullWidth ? "full" : undefined,
    ...buttonSizes[size],
    ...buttonVariants[variant],
  } as const;

  if (href) {
    const ButtonAsLink = Button as unknown as React.FC<
      Record<string, unknown> & { children?: React.ReactNode }
    >;
    return <ButtonAsLink as={NextLink} href={href} {...styles} {...rest} />;
  }

  return <Button {...styles} {...rest} />;
}

type IconButtonVariant = "solid" | "paper" | "ghost" | "danger";
type IconButtonSize = "sm" | "md" | "lg";

const iconButtonVariants: Record<IconButtonVariant, IconButtonProps> = {
  solid: {
    bg: COLORS.ink,
    color: "#fff",
    border: "0",
    _hover: { bg: COLORS.orange, transform: "translateY(-1px)" },
  },
  paper: {
    bg: "rgba(255,253,250,.94)",
    color: COLORS.ink,
    border: "0",
    _hover: { bg: COLORS.orange, color: "#fff" },
  },
  ghost: {
    bg: "transparent",
    color: COLORS.muted,
    border: "0",
    _hover: { color: COLORS.ink },
  },
  danger: {
    bg: "transparent",
    color: COLORS.danger,
    border: "0",
    _hover: { bg: COLORS.danger, color: "#fff" },
  },
};

const iconButtonSizes: Record<IconButtonSize, string> = { sm: "7", md: "9", lg: "11" };

export type AppIconButtonProps = Omit<IconButtonProps, "variant" | "size"> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

/** Yamada `IconButton` for round, icon-only actions. */
export function AppIconButton({ variant = "solid", size = "md", ...rest }: AppIconButtonProps) {
  return (
    <IconButton
      rounded="full"
      display="grid"
      placeItems="center"
      boxSize={iconButtonSizes[size]}
      minW="0"
      minH="0"
      p="0"
      transition="0.18s"
      {...iconButtonVariants[variant]}
      {...rest}
    />
  );
}

const inputStyles = {
  bg: "white",
  color: COLORS.ink,
  borderWidth: "1px",
  borderColor: COLORS.line,
  rounded: "2px",
  height: "auto",
  px: "2.5",
  py: "2",
  fontSize: "13px",
  transition: "border-color .2s",
  _focus: { borderColor: COLORS.orange, outline: "none", boxShadow: "none" },
  _focusVisible: { borderColor: COLORS.orange, outline: "none", boxShadow: "none" },
};

export function AppInput(props: InputProps) {
  return <Input {...inputStyles} {...props} />;
}

export function AppTextarea(props: TextareaProps) {
  return <Textarea {...inputStyles} minH="82px" resize="vertical" {...props} />;
}

export function AppNativeSelect(props: NativeSelectRootProps) {
  return <NativeSelect.Root {...inputStyles} cursor="pointer" {...props} />;
}

export type AppFieldProps = Omit<FieldRootProps, "children"> & {
  label: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

/** Yamada `Field` with compact label and error styling. */
export function AppField({ label, error, children, ...rest }: AppFieldProps) {
  return (
    <Field.Root
      label={label}
      display="grid"
      gap="1.5"
      invalid={Boolean(error)}
      {...(error ? { errorMessage: error } : {})}
      labelProps={{ fontSize: "11.5px", fontWeight: "700", color: COLORS.ink, mb: "0" }}
      errorMessageProps={{ fontSize: "11.5px", color: COLORS.danger }}
      {...rest}
    >
      {children}
    </Field.Root>
  );
}

export function AppTag(props: TagProps) {
  return (
    <Tag
      px="2.5"
      py="1"
      fontSize="11px"
      rounded="full"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={COLORS.line}
      bg="transparent"
      color={COLORS.muted}
      {...props}
    />
  );
}

type AppChipProps = {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
};

/**
 * Pill-shaped filter chip. Yamada's `Tag` does not support `asChild` (it wraps
 * its children internally), so the interactive element is a real button that
 * contains the styled Tag.
 */
export function AppChip({ selected, children, onClick, title }: AppChipProps) {
  return (
    <button type="button" className="chip-button" onClick={onClick} title={title} aria-pressed={selected}>
      <Tag
        px="4"
        py="2"
        fontSize="13px"
        rounded="full"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={selected ? COLORS.orange : COLORS.line}
        bg={selected ? COLORS.orange : "transparent"}
        color={selected ? "#fff" : COLORS.muted}
        fontWeight={selected ? 700 : 400}
        transition="0.2s"
        _hover={{ borderColor: selected ? COLORS.orange : COLORS.ink, color: selected ? "#fff" : COLORS.ink }}
      >
        {children}
      </Tag>
    </button>
  );
}

type AppAvatarProps = Omit<AvatarProps, "src" | "name"> & {
  name: string;
  src?: string | null;
};

export function AppAvatar({ name, src, ...rest }: AppAvatarProps) {
  return (
    <Avatar
      name={name}
      src={src ?? undefined}
      boxSize="9"
      bg="#e5c4ad"
      color={COLORS.ink}
      fontSize="11px"
      fontWeight="700"
      {...rest}
    />
  );
}

export function AppSkeleton(props: SkeletonProps) {
  return <Skeleton rounded="2px" startColor="#efe9e1" endColor="#f7f4ef" {...props} />;
}
