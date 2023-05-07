import slugify from 'slugify';

function slugifyFilename(filename: string) {
  const extension = filename.split('.').pop() || '';
  const nameWithoutExtension = filename.substring(0, filename.length - extension.length - 1);
  const slugifiedName = slugify(nameWithoutExtension, { lower: true });
  return `${slugifiedName}.${extension}`;
}

export default slugifyFilename;