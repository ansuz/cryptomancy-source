# cryptomancy-source

Provides a variety of entropy sources in different _flavours_.

## Secure

Cryptographically secure random integers that range between 0 and MAX_SAFE_INTEGER

## Insecure

Plain old random numbers provided by `Math.random()` in Javascript.

## Deterministic

A stream of deterministic integers initialized by a pool of buffer and a hashing mechanism.

If it is initialized and utilized in the same exact sequence two times, it will provide the same values.

