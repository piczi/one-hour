import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const FormSchema = z.object({
	name: z.string().max(8, { message: '最长8个字符'}),
	time: z
		.string()
		.refine((data: string) => /^-?\d+$/.test(data), {
			message: "输入值必须为数字",
		})
		.refine((data: string) => parseInt(data, 10) > 0, {
			message: "输入值必须为大于0的整数",
		}),
	text: z
		.string()
		.min(1, { message: "请输入提示文本" })
		.max(20, { message: "最多输入20个字符" }),
	open: z.boolean(),
});

export default function InputForm() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: '',
			time: "60",
			text: "",
			open: true,
		},
	});

	const [show, setShow] = useState(true);
	const { toast } = useToast();

	function onSubmit(data: z.infer<typeof FormSchema>) {
		chrome?.storage?.sync?.set(data).then(() => {
			chrome?.runtime.sendMessage({ action: "resetNotification" });
			toast({
				description: "配置成功！",
			});
		});
	}

	useEffect(() => {
		chrome?.permissions?.contains(
			{ permissions: ["notifications"] },
			function (result) {
				if (result) {
					console.log("有通知权限");
					setShow(true);
				} else {
					console.log("无通知权限");
					setShow(false);
				}
			}
		);
	}, []);

	useEffect(() => {
		if (show) {
			chrome?.storage.sync.get(["time", "text", "open", "name"], function (data) {
				if (data?.time) {
					form.setValue("time", data.time);
					form.setValue("text", data.text);
					form.setValue("open", data.open);
					form.setValue("name", data.name);
				}
			});
		}
	}, [show]);

	return show ? (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Card className="min-w-96 w-full">
						<CardHeader>
							<CardTitle>配置通知</CardTitle>
							<CardDescription>需要开启chrome系统通知</CardDescription>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>标题</FormLabel>
										<FormControl>
											<Input placeholder="标题" {...field} />
										</FormControl>
										<FormDescription>通知标题</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>间隔时长</FormLabel>
										<FormControl>
											<Input placeholder="间隔时间" {...field} />
										</FormControl>
										<FormDescription>通知间隔,时间为分钟</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="text"
								render={({ field }) => (
									<FormItem>
										<FormLabel>通知文本</FormLabel>
										<FormControl>
											<Textarea
												maxLength={20}
												placeholder="请输入通知文本"
												{...field}
											/>
										</FormControl>
										<FormDescription>最长20个字符</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="open"
								render={({ field }) => (
									<FormItem>
										<FormLabel>是否开启</FormLabel>
										<div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</div>
										<FormDescription>是否开启通知</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter>
							<Button type="submit" className="w-full">
								确定
							</Button>
						</CardFooter>
					</Card>
				</form>
			</Form>
			<Toaster />
		</>
	) : (
		<Card className="min-w-96 w-full">
			<CardHeader className="font-semibold">暂无权限</CardHeader>
			<CardContent className="h-14">请开启系统通知</CardContent>
			{/* <CardFooter></CardFooter> */}
		</Card>
	);
}
