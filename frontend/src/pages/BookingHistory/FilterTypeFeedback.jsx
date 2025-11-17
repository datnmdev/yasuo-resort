import React from 'react'
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';

const FilterTypeFeedback = () => {
    const [typeFeedback, setTypeFeedback] = useState('room');

    return (
        <>

            {/* chọn loại feedback */}
            <Card className="shadow-sm border-none">
                <CardContent className="flex items-center py-4">
                    <CardTitle className="text-base mr-4">Type of Feedback</CardTitle>

                    <Select value={typeFeedback} onValueChange={setTypeFeedback}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="room">Room</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="combo">Combo</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>



        </>
    )
}

export default FilterTypeFeedback