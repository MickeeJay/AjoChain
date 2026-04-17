// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Counters Library
/// @author AjoChain
/// @notice Small counter utilities for incrementing, decrementing, and resetting tracked values.
library Counters {
    struct Counter {
        uint256 _value;
    }

    error CounterUnderflow();

    /// @notice Returns the current counter value.
    /// @param counter Counter storage slot to read.
    /// @return currentValue The stored counter value.
    function current(Counter storage counter) internal view returns (uint256) {
        uint256 currentValue = counter._value;
        return currentValue;
    }

    /// @notice Increments the counter by one.
    /// @param counter Counter storage slot to update.
    function increment(Counter storage counter) internal {
        unchecked {
            ++counter._value;
        }
    }

    /// @notice Decrements the counter by one.
    /// @param counter Counter storage slot to update.
    function decrement(Counter storage counter) internal {
        if (counter._value == 0) {
            revert CounterUnderflow();
        }

        unchecked {
            --counter._value;
        }
    }

    /// @notice Resets the counter to zero.
    /// @param counter Counter storage slot to update.
    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}