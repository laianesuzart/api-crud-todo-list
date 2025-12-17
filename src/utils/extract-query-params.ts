export function extractQueryParams(query: string) {
  return query
    .substring(1)
    .split('&')
    .reduce<Record<string, string>>((queryParams, param) => {
      const [key, value] = param.split('=');
      queryParams[key] = value;

      return queryParams;
    }, {});
}
