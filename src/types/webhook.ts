export interface WebhookSettings {
  urls: string[];
  selectedUrl: string | null;
}

export interface WebhookMessage {
  username: string;
  avatar_url?: string;
  content?: string;
  embeds?: WebhookEmbed[];
}

export interface WebhookEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: WebhookField[];
  thumbnail?: {
    url: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface WebhookField {
  name: string;
  value: string;
  inline?: boolean;
}