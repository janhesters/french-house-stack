import { ImageIcon } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/shadcn-ui';

export type DragAndDropProps = JSX.IntrinsicElements['input'] & {
  dragAndDropLabel?: string;
  fileTypesLabel?: string;
  /** Fires with the chosen file as soon as the user choses a file. */
  onFileChosen?: (file: File) => void;
  /** Fires with the files cleaned name as soon as a user choses a file. */
  onFilenameChosen?: (filename: string) => void;
  uploadLabel?: string;
};

export const DragAndDrop = forwardRef<HTMLInputElement, DragAndDropProps>(
  function DragAndDrop(
    {
      className,
      dragAndDropLabel,
      fileTypesLabel,
      id,
      name,
      onFileChosen,
      onFilenameChosen,
      uploadLabel,
      ...props
    },
    forwardedRef,
  ) {
    const { t } = useTranslation('drag-and-drop');

    // Show the file name in the user interface.
    const [filename, setFilename] = useState<string | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update the forwarded ref when the new ref changes.
    useEffect(() => {
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(fileInputRef.current);
        } else {
          forwardedRef.current = fileInputRef.current;
        }
      }
    }, [forwardedRef]);

    // Drag and drop handling.
    const [dragIsActive, setDragIsActive] = useState(false);

    return (
      <div
        className={cn(
          'mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10',
          className,
          dragIsActive && 'relative',
        )}
        onDragEnter={event => {
          // 1. Show the overlay.
          event.preventDefault();
          event.stopPropagation();
          setDragIsActive(true);
        }}
        onDrop={event => {
          // 4. Prevent file from opening in the browser when dropped and
          // close the overlay.
          event.preventDefault();
          event.stopPropagation();
          setDragIsActive(false);

          // 5. Set the file as the input value and show its name in the
          // user interface.
          if (fileInputRef.current) {
            fileInputRef.current.files = event.dataTransfer.files;
            onFileChosen?.(event.dataTransfer.files[0]);
            const newFilename = event.dataTransfer.files[0].name;
            setFilename(newFilename);
            onFilenameChosen?.(newFilename);
          }
        }}
      >
        <div className="flex flex-col items-center text-center">
          <ImageIcon
            aria-hidden="true"
            className={cn(
              'mx-auto h-12 w-12',
              filename ? 'text-primary' : 'text-muted-foreground',
            )}
          />

          {filename && (
            <div className="text-sm text-foreground">{filename}</div>
          )}

          <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
            <label
              className="relative cursor-pointer rounded-md bg-background font-semibold text-primary hover:text-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-background dark:text-foreground dark:hover:text-primary"
              htmlFor={id || 'fileUpload'}
            >
              <span>{uploadLabel ?? t('upload-label')}</span>

              <input
                className="sr-only"
                id={id || 'fileUpload'}
                name={name || 'fileUpload'}
                onChange={event => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onFileChosen?.(file);
                    const fileName = file.name;
                    const cleanedFileName = fileName.replace(
                      'C:\\fakepath\\',
                      '',
                    );
                    setFilename(cleanedFileName);
                    onFilenameChosen?.(cleanedFileName);
                  }
                }}
                ref={fileInputRef}
                {...props}
                type="file"
              />
            </label>

            <p className="pl-1">
              {dragAndDropLabel ?? t('drag-and-drop-label')}
            </p>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            {fileTypesLabel ?? t('file-types-label')}
          </p>
        </div>

        {dragIsActive && (
          <div
            className="absolute top-0 h-full w-full bg-background opacity-50"
            onDragOver={event => {
              // 2. Prevent file from opening in the browser when dropped.
              event.preventDefault();
              event.stopPropagation();
            }}
            onDragLeave={event => {
              // 3. Remove overlay when dragging outside the border.
              event.preventDefault();
              event.stopPropagation();
              setDragIsActive(false);
            }}
          />
        )}
      </div>
    );
  },
);
