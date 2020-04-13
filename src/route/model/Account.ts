export interface Account {
  subject: string;

  links: [
        {
          rel: string,
          type: string,
          href: string
        }
    ];
}
