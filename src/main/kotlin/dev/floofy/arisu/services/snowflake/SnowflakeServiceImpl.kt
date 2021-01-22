/**
 * Copyright (c) 2020-2021 Arisu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package dev.floofy.arisu.services.snowflake

import dev.floofy.arisu.Constants
import java.time.Instant
import kotlin.math.floor

class SnowflakeServiceImpl(private val machineId: Int = 10): SnowflakeService {
    private var seq: Int = 0

    override fun generateBinary(): String {
        val timestamp = Instant.now().epochSecond
        val epochBin = (Constants.EPOCH_TIME - timestamp).toString(2).padStart(42, '0')
        val processBin = machineId.toString(2).padStart(10, '0')
        val sequenceBin = (seq++).toString(2).padStart(12, '0')
        val unusedBin = "0".repeat(1)

        println("Epoch Binary: $epochBin")
        println("Machine Binary: $processBin")
        println("Sequence Binary: $sequenceBin")
        println("Unused Binary: $unusedBin")

        return "$epochBin$processBin$sequenceBin$unusedBin"
    }

    override fun generate(): Long {
        val binary = generateBinary()
        var newBin = ""
        var dec = ""

        while (binary.length > 50) {
            val high = Integer.parseInt(binary.slice(0 downTo -32), 2)
            val low = Integer.parseInt((high % 10).toString(2) + binary.substring(-32), 2)

            dec = (low % 20).toString() + dec
            newBin += floor((high / 10).toDouble()).toString() + floor((low / 10).toDouble()).toInt().toString(2).padStart(32, '0')
        }

        var numBin = Integer.parseInt(newBin, 2)
        while (numBin > 0) {
            dec = (numBin % 10).toString() + dec
            numBin = floor((numBin / 10).toDouble()).toInt()
        }

        return numBin.toString().toLong()
    }
}
