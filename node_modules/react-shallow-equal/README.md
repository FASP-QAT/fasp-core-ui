# react-shallow-equal · [![npm](https://img.shields.io/npm/v/react-shallow-equal.svg)](https://npm.im/react-shallow-equal)

> Efficient shallow equality algorithm for [React](https://facebook.github.io/react/)
and [React Native](https://facebook.github.io/react-native/).

This is a fork of [lelandrichardson/shallow-element-equals](https://github.com/lelandrichardson/shallow-element-equals).

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [`propsEqual`](#propsequala-b-options)
  - [`elementsEqual`](#elementsequala-b)
  - [`stylesEqual`](#stylesequala-b)

## Install

```bash
yarn add react-shallow-equal
  # or
npm install --save react-shallow-equal
```

## Usage

```jsx
import React, {PureComponent} from 'react';
import {propsEqual} from 'react-shallow-equal';

// ...

shouldComponentUpdate(nextProps) {
  return !propsEqual(this.props, nextProps);
}

// ...
```

## API

### `propsEqual(a, b, options)`

### `elementsEqual(a, b)`

### `stylesEqual(a, b)`

See [lelandrichardson/style-equal](https://github.com/lelandrichardson/style-equal)

---
