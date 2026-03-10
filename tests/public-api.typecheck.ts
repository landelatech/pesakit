import type {
  AccountBalanceResponse,
  Mpesa,
  ReversalResponse,
  StkPushResult,
  StkQueryResponse,
  TransactionStatusResponse,
} from "../dist/index.js";

type Expect<T extends true> = T;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;

type StkPushReturn = ReturnType<Mpesa["stkPush"]>;
type StkQueryReturn = ReturnType<Mpesa["stkQuery"]>;
type AccountBalanceReturn = ReturnType<Mpesa["account"]["balance"]>;
type TransactionStatusReturn = ReturnType<Mpesa["transaction"]["status"]>;
type ReversalReturn = ReturnType<Mpesa["reversal"]["reverse"]>;

type StkPushReturnMatches = Expect<Equal<StkPushReturn, Promise<StkPushResult>>>;
type StkQueryReturnMatches = Expect<Equal<StkQueryReturn, Promise<StkQueryResponse>>>;
type AccountBalanceReturnMatches = Expect<
  Equal<AccountBalanceReturn, Promise<AccountBalanceResponse>>
>;
type TransactionStatusReturnMatches = Expect<
  Equal<TransactionStatusReturn, Promise<TransactionStatusResponse>>
>;
type ReversalReturnMatches = Expect<Equal<ReversalReturn, Promise<ReversalResponse>>>;

export type PublicApiTypeAssertions = [
  StkPushReturnMatches,
  StkQueryReturnMatches,
  AccountBalanceReturnMatches,
  TransactionStatusReturnMatches,
  ReversalReturnMatches,
];
