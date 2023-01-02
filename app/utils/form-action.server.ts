import { json, redirect } from '@remix-run/node';
import { createFormAction } from 'remix-forms';

export const formAction = createFormAction({ redirect, json });
