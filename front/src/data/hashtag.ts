export type TwittType = {
    user: string;
    tweet: string;
    clasiffication: [number, number];
};

export type HashtagType = {
    id: string;
    title: string;
    color: string;
    tweets: TwittType[];
};
